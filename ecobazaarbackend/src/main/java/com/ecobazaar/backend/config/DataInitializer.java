package com.ecobazaar.backend.config;

import com.ecobazaar.backend.entity.Category;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.CategoryRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.service.CarbonCalculatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CarbonCalculatorService carbonCalculatorService;

    @Override
    public void run(String... args) throws Exception {
        // Initialize categories
        initializeCategories();
        
        // Initialize seller user
        User seller = initializeSeller();
        
        // Initialize products
        initializeProducts(seller);
    }

    private void initializeCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                createCategory("Electronics", "Electronic devices and gadgets"),
                createCategory("Fashion", "Clothing and fashion items"),
                createCategory("Home & Garden", "Home improvement and gardening products"),
                createCategory("Office", "Office supplies and stationery"),
                createCategory("Personal Care", "Natural and organic personal care products"),
                createCategory("Food & Beverages", "Organic and sustainable food products")
            );
            categoryRepository.saveAll(categories);
            System.out.println("Initialized " + categories.size() + " categories");
        }
    }

    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIsActive(true);
        return category;
    }

    private User initializeSeller() {
        User seller = userRepository.findByUsername("testseller").orElse(null);
        if (seller == null) {
            seller = new User();
            seller.setUsername("testseller");
            seller.setEmail("seller@ecobazaar.com");
            seller.setPassword("password123"); // Plain text as per your PasswordEncoder
            seller.setFirstName("Test");
            seller.setLastName("Seller");
            seller.setRole(Role.SELLER);
            seller.setIsActive(true);
            seller.setEcoPoints(0);
            seller = userRepository.save(seller);
            System.out.println("Created test seller user: " + seller.getUsername());
        }
        return seller;
    }

    private void initializeProducts(User seller) {
        if (productRepository.count() == 0) {
            List<Category> categories = categoryRepository.findAll();
            Category electronics = categories.stream()
                .filter(c -> c.getName().equals("Electronics"))
                .findFirst()
                .orElse(categories.get(0));
            Category fashion = categories.stream()
                .filter(c -> c.getName().equals("Fashion"))
                .findFirst()
                .orElse(categories.get(0));
            Category home = categories.stream()
                .filter(c -> c.getName().equals("Home & Garden"))
                .findFirst()
                .orElse(categories.get(0));
            Category office = categories.stream()
                .filter(c -> c.getName().equals("Office"))
                .findFirst()
                .orElse(categories.get(0));
            Category personalCare = categories.stream()
                .filter(c -> c.getName().equals("Personal Care"))
                .findFirst()
                .orElse(categories.get(0));

            List<Product> products = Arrays.asList(

                createProduct("Jute Cloth Bag",
                    "Suitable for daily use like groceries.",
                    new BigDecimal("59"), home, seller, new BigDecimal("0.5"), new BigDecimal("30"), true,
                    "https://img.freepik.com/premium-photo/highresolution-jute-bag-image-4k-detailed-texture-ecofriendly-natural-fiber-material_1192771-5050.jpg?semt=ais_hybrid&w=740&q=80"),

                createProduct("Cotton T-Shirt",
                    "Comfortable cotton t-shirt made from 100% certified organic cotton.",
                    new BigDecimal("199"), fashion, seller, new BigDecimal("0.2"), new BigDecimal("50"), true,
                    "https://cdn.yourdesignstore.in/uploads/yds/productImages/full/17155845641871Main-Product-Image-1-1.png"),

                createProduct("Solar Power Bank",
                    "Portable solar charger with 10,000mAh capacity.",
                    new BigDecimal("1249"), electronics, seller, new BigDecimal("0.3"), new BigDecimal("100"), true,
                    "https://5.imimg.com/data5/SELLER/Default/2024/6/427061773/QA/JS/JS/128786604/20-500x500.jpg"),

                createProduct("Reused Paper Notebook",
                    "200 pages notebook made from 100% recycled papers.",
                    new BigDecimal("119"), office, seller, new BigDecimal("0.1"), new BigDecimal("25"), true,
                    "https://m.media-amazon.com/images/I/817mFy4yYkL.jpg"),

                createProduct("Re-chargeable battery cell",
                    "USB re-chargeable cells. Single unit.",
                    new BigDecimal("45"), home, seller, new BigDecimal("0.4"), new BigDecimal("40"), true,
                    "https://5.imimg.com/data5/SELLER/Default/2025/2/492338752/EG/YX/GJ/11709116/18650-li-ion-2600mah-3c-rechargeable-battery-cell-500x500.jpg"),

                createProduct("Glass Vase",
                    "Beautiful vase made from reuse glass powder and china-clay.",
                    new BigDecimal("499"), home, seller, new BigDecimal("0.6"), new BigDecimal("35"), true,
                    "https://www.shutterstock.com/image-photo/handcrafted-clay-vase-featuring-detailed-600nw-2623874541.jpg")
            );

            productRepository.saveAll(products);
            System.out.println("Initialized " + products.size() + " products");
        }
    }

    private Product createProduct(String name, String description, BigDecimal price, 
                                 Category category, User seller, BigDecimal weight, 
                                 BigDecimal shippingDistance, Boolean isEcoFriendly, String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setSeller(seller);
        product.setWeightKg(weight);
        product.setShippingDistanceKm(shippingDistance);
        product.setIsEcoFriendly(isEcoFriendly);
        product.setStockQuantity(50);
        product.setIsActive(true);
        product.setImageUrl(imageUrl);
        
        // Calculate carbon score
        BigDecimal carbonScore = carbonCalculatorService.calculateCarbonScore(
            weight, shippingDistance, isEcoFriendly
        );
        product.setCarbonScore(carbonScore);
        
        return product;
    }
}

