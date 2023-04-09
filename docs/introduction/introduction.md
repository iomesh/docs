---
id: introduction
title: Introduction 
sidebar_label: Introduction
---

## What is IOMesh?

IOMesh is a Kubernetes-native storage system that manages storage resources within a Kubernetes cluster, automates operations and maintenance, and provides various types of persistent storage, data protection and migration capabilities for data applications such as MySQL, Cassandra, MongoDB and middleware running on Kubernetes.

## Key Features 

**Kubernetes Native**

IOMesh is fully built on the capabilities of Kubernetes and implements storage as code through declarative APIs, allowing for managing infrastructure and deployment environments through code to better support DevOps.

**High Performance** 

IOMesh enables I/O-intensive databases and applications to run efficiently in the container environment. Leveraging high-performance I/O link, IOMesh achieves high IOPS while maintaining low latency to ensure stable operation of data applications.

**No Kernel Dependencies** 
   
Running separately in user space instead of kernel space, IOMesh is isolated from other applications on the same node, which means that when IOMesh fails, other applications can deliver services as usual without causing the entire system to fail. Since IOMesh is kernel independent, you do not need to install any kernel modules or worry about kernel version compatibility issues.

**Tiered Storage**

IOMesh facilitates cost-effective, hybrid deployment of SSDs & HDDs, maximizing storage performance and capacity for different media while reducing storage costs from the outset.

**Data Protection & Security**

A system with multiple levels of data protection makes sure that data is always secure and available. IOMesh does this by placing multiple replicas on different nodes, allowing PV-level snapshots for easy recovery in case of trouble, while also isolating abnormal disks to minimize the impact and reduce the operational burden. Authentication is also provided for specific PVs to ensure secure access.

**Fully Integrated into Kubernetes Ecosystem**

IOMesh flexibly provides storage for stateful applications via CSI even when they are migrated across nodes or clusters. It also works seamlessly with the Kubernetes toolchain, easily deploying IOMesh using Helm Chart and integrating with Prometheus and Grafana to provide standardized, visualized monitoring and alerting service.

## Architecture
![IOMesh arch](https://user-images.githubusercontent.com/78140947/122766241-e2352c00-d2d3-11eb-9630-bb5b428c3178.png)
