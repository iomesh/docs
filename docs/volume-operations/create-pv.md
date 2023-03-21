---
id: create-pv
title: Creating PV
sidebar_label: Creating PV
---

To create a PV, you should first create a PVC. Once done, IOMesh will sense the creation of this PVC and automatically create a new PV based on the `spec` in it, binding them together. Then the pair of PV and PVC will be ready to use.

Acccess mode 说明

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create a YAML config `pvc.yaml`. Configure access mode and storage.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: # Specify the StorageClass.
      accessModes:
        - # Specify the access mode. 问子银哪些可以配置
      resources:
        requests:
          storage:  # Specify the storage capacity value.
      volumeMode: Block
    ```


    For details, refer to [Kubernetes Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
  
2. Run the following command to create the PVC.

    ```
    kubectl apply -f pvc.yaml
    ```

3. Run the following command to see the PVC.

    ```
    kubectl get pvc iomesh-example-pvc
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    iomesh-example-pvc                          Bound    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi        RWO            iomesh-csi-driver   21h   
    ```